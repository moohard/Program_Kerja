<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTodoItemRequest;
use App\Http\Requests\UpdateTodoItemRequest;
use App\Http\Resources\TodoItemResource;
use App\Models\RencanaAksi;
use App\Models\TodoItem;

class TodoItemController extends Controller
{

    // Mengambil semua to-do item untuk sebuah Rencana Aksi
    public function index(RencanaAksi $rencanaAksi)
    {

        return TodoItemResource::collection($rencanaAksi->todoItems()->orderBy('created_at')->get());
    }

    // Menyimpan to-do item baru
    public function store(StoreTodoItemRequest $request, RencanaAksi $rencanaAksi)
    {

        $todoItem = $rencanaAksi->todoItems()->create($request->validated());

        return new TodoItemResource($todoItem);
    }

    // Memperbarui to-do item (misalnya, menandai selesai)
    public function update(UpdateTodoItemRequest $request, TodoItem $todoItem)
    {

        $todoItem->update($request->validated());
        return new TodoItemResource($todoItem);
    }

    // Menghapus to-do item
    public function destroy(TodoItem $todoItem)
    {

        $todoItem->delete();
        return response()->noContent();
    }

}
