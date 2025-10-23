<?php

namespace App\Providers;

use App\Channels\FcmChannel;
use GuzzleHttp\Client;
use GuzzleHttp\ClientInterface;
use Illuminate\Support\ServiceProvider;
use Kreait\Firebase\Messaging\CloudMessage;
use Notification;

class AppServiceProvider extends ServiceProvider
    {
    /**
     * Register any application services.
     */
    public function register(): void
        {
        $this->app->bind(ClientInterface::class, Client::class);
        }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
        {
        Notification::extend('fcm', function ($app) {
            return new class ($app->make('firebase.messaging')) {
                protected $messaging;

                public function __construct($messaging)
                    {
                    $this->messaging = $messaging;
                    }

                public function send($notifiable, $notification)
                    {
                    $tokens = (array) $notifiable->routeNotificationFor('fcm', $notification);

                    if (empty($tokens)) {
                        return;
                    }

                    $messagePayload = $notification->toFcm($notifiable);

                    foreach ($tokens as $token) {
                        try {
                            $message = CloudMessage::withTarget('token', $token)
                                ->withNotification($messagePayload['notification'])
                                ->withData($messagePayload['data']);
                            
                            $this->messaging->send($message);
                        } catch (\Exception $e) {
                            // Log error for a specific token, but don't stop the loop
                            \Log::error('Failed to send FCM to a token.', ['user_id' => $notifiable->id, 'exception' => $e->getMessage()]);
                        }
                    }
                    }
                };
            });
        }
    }