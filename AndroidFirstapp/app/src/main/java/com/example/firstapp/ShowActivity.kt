package com.example.firstapp

import android.annotation.SuppressLint
import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import kotlinx.android.synthetic.main.activity_main.*
import kotlinx.android.synthetic.main.activity_show.*

class ShowActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_show)
        getAndShowName()
        btnBack.setOnClickListener{onBackPressed()}
        btHeroes.setOnClickListener { ShowHeroes() }
    }

    fun ShowHeroes() {
        val intent = Intent(this, Heroes_Activity::class.java)
        startActivity(intent)
    }



    @SuppressLint("StringFormatInvalid")
    fun getAndShowName() {
        val bundle = intent.extras
        val name = bundle?.get("name")
        tvGreeting.text=getString(R.string.welcome).plus("\n").plus(name)
    }
}