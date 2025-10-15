<?php

namespace App\Channels;

use Illuminate\Notifications\Notification;
use Kreait\Firebase\Messaging;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Exception\MessagingException;
use Kreait\Firebase\Exception\FirebaseException;

class FcmChannel
    {
    /**
     * The Firebase Messaging instance.
     *
     * @var \Kreait\Firebase\Messaging
     */
    protected $messaging;

    /**
     * Create a new channel instance.
     *
     * @param \Kreait\Firebase\Messaging $messaging
     */
    public function __construct(Messaging $messaging)
        {
        $this->messaging = $messaging;
        }

    /**
     * Send the given notification.
     *
     * @param mixed $notifiable
     * @param \Illuminate\Notifications\Notification $notification
     * @return void
     */
    public function send($notifiable, Notification $notification)
        {
        // Dapatkan token dari model User (via method routeNotificationForFcm)
        $tokens = $notifiable->routeNotificationFor('fcm', $notification);

        \Log::info('FCM Channel: Processing notification for user ID: ' . $notifiable->id);
        \Log::info('FCM Channel: Found tokens: ' . json_encode($tokens));

        // Periksa apakah tokens valid dan tidak kosong
        if (empty($tokens) || !is_array($tokens) || count(array_filter($tokens)) === 0) {
            \Log::warning('FCM Channel: No valid tokens found for user ID: ' . $notifiable->id);
            return;
            }

        // Filter tokens yang tidak null atau empty
        $validTokens = array_filter($tokens, function ($token) {
            return !empty($token) && is_string($token);
            });

        if (empty($validTokens)) {
            \Log::warning('FCM Channel: No valid tokens after filtering for user ID: ' . $notifiable->id);
            return;
            }

        \Log::info('FCM Channel: Valid tokens count: ' . count($validTokens));

        // Dapatkan pesan dari class Notifikasi (RencanaAksiAssigned)
        $message = $notification->toFcm($notifiable);

        if (!$message instanceof CloudMessage) {
            \Log::error('Metode toFcm harus mengembalikan instance dari Kreait\Firebase\Messaging\CloudMessage');
            return;
            }

        try {
            // Kirim notifikasi ke semua token milik user
            \Log::info('FCM Channel: Sending multicast message to ' . count($validTokens) . ' tokens');
            $response = $this->messaging->sendMulticast($message, $validTokens);

            \Log::info('FCM Channel: Success count: ' . $response->successCount());
            \Log::info('FCM Channel: Failure count: ' . $response->failureCount());

            if ($response->failureCount() > 0) {
                foreach ($response->failures()->getItems() as $failure) {
                    \Log::error('FCM Channel: Failure - Token: ' . $failure->target()->value() . ' - ' . $failure->error()->getMessage());
                    }
                }

            }
        catch (\Kreait\Firebase\Exception\MessagingException | FirebaseException $e) {
            \Log::error('Gagal mengirim notifikasi FCM: ' . $e->getMessage(), [
                'user_id'   => $notifiable->id,
                'exception' => $e,
            ]);
            }
        }
    }