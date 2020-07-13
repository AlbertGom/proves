package com.example.tasksapp

import android.app.Application
import androidx.room.Room

open class TasksApp: Application() {

    companion object {
        lateinit var database: TasksDatabase
    }

    override fun onCreate() {
        super.onCreate()
        database =  Room.databaseBuilder(this, TasksDatabase::class.java, "tasks-db").build()
    }
}