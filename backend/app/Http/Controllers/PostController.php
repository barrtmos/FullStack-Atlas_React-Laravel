<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;

class PostController extends Controller
{
    public function index(Request $request)
    {
        $query = Post::query()->latest();

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where('title', 'like', "%{$search}%");
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        $posts = $query->paginate((int) $request->input('per_page', 10));

        return response()->json($posts);
    }

    public function show(Post $post)
    {
        return response()->json(['post' => $post]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'status' => ['required', 'in:draft,published,archived'],
        ]);

        /** @var User $user */
        $user = $request->attributes->get('auth_user');

        $post = Post::query()->create($validated + ['user_id' => $user->id]);

        return response()->json(['post' => $post], 201);
    }

    public function update(Request $request, Post $post)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'status' => ['required', 'in:draft,published,archived'],
        ]);

        $post->update($validated);

        return response()->json(['post' => $post]);
    }

    public function destroy(Post $post)
    {
        $post->delete();

        return response()->json(['message' => 'Post deleted']);
    }
}
