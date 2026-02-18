<?php

return [
    'accepted' => 'Поле :attribute должно быть принято.',
    'array' => 'Поле :attribute должно быть массивом.',
    'boolean' => 'Поле :attribute должно быть true или false.',
    'confirmed' => 'Поле :attribute не совпадает с подтверждением.',
    'email' => 'Поле :attribute должно быть корректным email адресом.',
    'in' => 'Выбранное значение для :attribute некорректно.',
    'integer' => 'Поле :attribute должно быть целым числом.',
    'max' => [
        'numeric' => 'Поле :attribute не должно быть больше :max.',
        'string' => 'Поле :attribute не должно быть длиннее :max символов.',
        'array' => 'Поле :attribute не должно содержать более :max элементов.',
        'file' => 'Файл :attribute не должен быть больше :max килобайт.',
    ],
    'min' => [
        'numeric' => 'Поле :attribute должно быть не меньше :min.',
        'string' => 'Поле :attribute должно содержать минимум :min символов.',
        'array' => 'Поле :attribute должно содержать минимум :min элементов.',
        'file' => 'Файл :attribute должен быть не меньше :min килобайт.',
    ],
    'required' => 'Поле :attribute обязательно для заполнения.',
    'string' => 'Поле :attribute должно быть строкой.',
    'unique' => 'Значение поля :attribute уже занято.',

    'attributes' => [
        'name' => 'имя',
        'email' => 'email',
        'password' => 'пароль',
        'title' => 'заголовок',
        'body' => 'текст',
        'status' => 'статус',
    ],
];
