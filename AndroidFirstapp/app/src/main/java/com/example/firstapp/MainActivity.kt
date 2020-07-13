package com.example.firstapp

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.Toast
import kotlinx.android.synthetic.main.activity_main.*

class MainActivity : AppCompatActivity() {

    val uf:Users_Functions = Users_Functions()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        uf.init_users()
        btnChangeActivity.setOnClickListener { checkValue() }
    }

    fun checkValue() {
        if(etName.text.toString().isEmpty())
            Toast.makeText(this, "You must introduce a name", Toast.LENGTH_SHORT).show()
        else{
            if(uf.find(etName.text.toString()) == 0){
            Toast.makeText(this, etName.text.toString().plus(" is NOT a registered user"), Toast.LENGTH_SHORT).show()
           }

            else Toast.makeText(this, etName.text.toString().plus(" is a registered user"), Toast.LENGTH_SHORT).show()
            val intent = Intent(this, ShowActivity::class.java)
            intent.putExtra("name", etName.text.toString())
            startActivity(intent)
        }
    }
}