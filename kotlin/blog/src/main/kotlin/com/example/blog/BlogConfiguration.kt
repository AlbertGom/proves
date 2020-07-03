package com.example.blog

import org.springframework.boot.ApplicationRunner
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
@Configuration
class BlogConfiguration {

    @Bean
    fun databaseInitializer(userRepository: UserRepository,
                            articleRepository: ArticleRepository) = ApplicationRunner {

        val AGomariz = userRepository.save(User("AGomariz", "Albert", "Gomáriz","Computer Engineer"))
        val MCosta = userRepository.save(User("MCosta", "Mar", "Costa","Psicologist"))
        articleRepository.save(Article(
                title = "Learning Kotlin",
                headline = "I like computer science.",
                content = "I'm learning Spring & Kotlin",
                author = AGomariz
        ))
        articleRepository.save(Article(
                title = "Hobbies",
                headline = "I like volleyball.",
                content = "I play in Tiana CV",
                author = MCosta
        ))
    }
}