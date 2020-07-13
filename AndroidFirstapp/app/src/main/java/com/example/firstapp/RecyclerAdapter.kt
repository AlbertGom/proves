package com.example.firstapp


import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.recyclerview.widget.RecyclerView
import com.squareup.picasso.Picasso

class RecyclerAdapter : RecyclerView.Adapter<RecyclerAdapter.ViewHolder>() {

    var superheros: MutableList<Superhero>  = ArrayList()
    lateinit var context: Context


    fun RecyclerAdapter(superheros : MutableList<Superhero>, context: Context){
        this.superheros = superheros
        this.context = context
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val item = superheros.get(position)
        holder.bind(item, context)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val layoutInflater = LayoutInflater.from(parent.context)
        return ViewHolder(layoutInflater.inflate(R.layout.item_superhero_list, parent, false))
    }

    override fun getItemCount(): Int {
        return superheros.size
    }


    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val superheroName = view.findViewById(R.id.tvSuperhero) as TextView
        val realName = view.findViewById(R.id.tvRealName) as TextView
        val publisher = view.findViewById(R.id.tvPublisher) as TextView
        val avatar = view.findViewById(R.id.ivAvatar) as ImageView

        fun bind(superhero:Superhero, context: Context){
            superheroName.text = superhero.superhero
            realName.text = superhero.realName
            publisher.text = superhero.publisher
            itemView.setOnClickListener(View.OnClickListener { Toast.makeText(context, superhero.superhero, Toast.LENGTH_SHORT).show() })
            avatar.loadUrl(superhero.photo)
        }

        fun ImageView.loadUrl(url: String) {
            Picasso.with(context).load(url).into(this)
        }
    }

}




