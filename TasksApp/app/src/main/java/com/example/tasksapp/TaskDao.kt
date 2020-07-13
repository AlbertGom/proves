package com.example.tasksapp

import androidx.room.*

@Dao
interface TaskDao {
    @Query("SELECT * FROM task_entity")
    fun getAllTasks(): MutableList<TaskEntity>

    @Query("SELECT * FROM task_entity WHERE isDone == 1")
    fun getAllTasksDone():MutableList<TaskEntity>

    @Insert
    fun addTask(taskEntity : TaskEntity):Long

    @Query("SELECT * FROM task_entity where id like:id")
    fun getTaskById(id: Long): TaskEntity

    @Update
    fun updateTask(taskEntity: TaskEntity):Int

    @Delete
    fun deleteTask(taskEntity: TaskEntity):Int
}