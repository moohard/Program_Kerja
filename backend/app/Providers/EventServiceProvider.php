<?php

namespace App\Providers;

use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;
use App\Models\RencanaAksi;
use App\Observers\RencanaAksiObserver;
use App\Models\TodoItem;
use App\Observers\TodoItemObserver;

class EventServiceProvider extends ServiceProvider
{

    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],
    ];

    /**
     * The model observers for your application.
     *
     * @var array
     */
    protected $observers = [
        RencanaAksi::class => [RencanaAksiObserver::class],
        TodoItem::class    => [TodoItemObserver::class],
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {

        //
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {

        return FALSE;
    }

}
