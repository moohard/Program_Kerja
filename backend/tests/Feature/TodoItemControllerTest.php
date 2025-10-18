<?php

namespace Tests\Feature;

use App\Models\RencanaAksi;
use App\Models\TodoItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TodoItemControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_get_list_of_todo_items_for_a_rencana_aksi(): void
    {
        $user = User::factory()->create();
        $rencanaAksi = RencanaAksi::factory()->create();
        TodoItem::factory()->count(3)->create(['rencana_aksi_id' => $rencanaAksi->id]);
        // Create an extra one for another Rencana Aksi to ensure filtering works
        TodoItem::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
                         ->getJson("/api/rencana-aksi/{$rencanaAksi->id}/todo-items");

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'deskripsi',
                        'completed',
                    ]
                ]
            ]);
    }

    public function test_can_create_a_new_todo_item(): void
    {
        $user = User::factory()->create();
        $rencanaAksi = RencanaAksi::factory()->create();

        $todoData = [
            'deskripsi' => 'Todo Item Test Baru',
        ];

        $response = $this->actingAs($user, 'sanctum')
                         ->postJson("/api/rencana-aksi/{$rencanaAksi->id}/todo-items", $todoData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'deskripsi',
                    'completed',
                ]
            ])
            ->assertJsonFragment($todoData);

        $this->assertDatabaseHas('todo_items', $todoData);
    }
}
