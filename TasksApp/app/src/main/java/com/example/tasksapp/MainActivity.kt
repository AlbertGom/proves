package com.example.tasksapp

import android.app.Activity
import android.content.Context
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.inputmethod.InputMethodManager
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import kotlinx.android.synthetic.main.activity_main.*
import org.jetbrains.anko.doAsync
import org.jetbrains.anko.uiThread

class MainActivity : AppCompatActivity() {

    lateinit var recyclerView: RecyclerView
    lateinit var adapter: TasksAdapter
    lateinit var tasks: MutableList<TaskEntity>


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        tasks=ArrayList()
        getTasks()
        btnAddTask.setOnClickListener {
            addTask(TaskEntity(name = etTask.text.toString()))}

    }

    fun addTask(task:TaskEntity){
        doAsync {
            val id = TasksApp.database.taskDao().addTask(task)
            val recoveryTask = TasksApp.database.taskDao().getTaskById(id)
            uiThread {
                tasks.add(recoveryTask)
                adapter.notifyItemInserted(tasks.size)
                clearFocus()
                hideKeyboard()
            }
        }
    }

    fun clearFocus(){
        etTask.setText("")
    }

    fun Context.hideKeyboard() {
        val inputMethodManager = getSystemService(Activity.INPUT_METHOD_SERVICE) as InputMethodManager
        inputMethodManager.hideSoftInputFromWindow(currentFocus?.windowToken, 0)
    }

    fun getTasks(){
        doAsync {
            tasks = TasksApp.database.taskDao().getAllTasks()
            uiThread {
                setUpRecyclerView(tasks)
            }
        }
    }

    fun setUpRecyclerView(tasks: List<TaskEntity>) {
        adapter = TasksAdapter(tasks, { updateTask(it) }, {deleteTask(it)})
        recyclerView = findViewById(R.id.rvTask)
        recyclerView.setHasFixedSize(true)
        recyclerView.layoutManager = LinearLayoutManager(this)
        recyclerView.adapter = adapter
    }

    fun updateTask(task: TaskEntity) {
        doAsync {
            task.isDone = !task.isDone
            TasksApp.database.taskDao().updateTask(task)
        }
    }

    fun deleteTask(task: TaskEntity){
        doAsync {
            val position = tasks.indexOf(task)
            TasksApp.database.taskDao().deleteTask(task)
            tasks.remove(task)
            uiThread {
                adapter.notifyItemRemoved(position)
            }
        }
    }
}
