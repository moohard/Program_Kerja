<?php

namespace App\Providers;

use App\Channels\FcmChannel;
use GuzzleHttp\Client;
use GuzzleHttp\ClientInterface;
use Illuminate\Support\ServiceProvider;
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
                    $message = $notification->toFcm($notifiable);

                    if ($message) {
                        $this->messaging->send($message);
                        }
                    }
                };
            });
        }
    }