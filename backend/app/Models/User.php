<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'jabatan_id',
        'photo_url',
    ];

    /**
     * Get the jabatan that owns the user.
     */
    public function jabatan()
    {
        return $this->belongsTo(Jabatan::class);
    }


    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Mendefinisikan relasi ke DeviceToken
     */
    public function deviceTokens()
    {
        return $this->hasMany(DeviceToken::class);
    }

    /**
     * Mengambil semua token FCM milik user yang valid.
     * Laravel akan otomatis memanggil method ini.
     */
    public function routeNotificationForFcm($notification = null)
    {
        // filter() akan menghapus semua nilai NULL atau string kosong dari koleksi
        return $this->deviceTokens()->pluck('token')->filter()->toArray();
    }
}