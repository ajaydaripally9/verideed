package com.verideed.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {
    public static void main(String[] args) {
        String dbUrl = System.getenv("SPRING_DATASOURCE_URL");
        if (dbUrl == null) {
            dbUrl = System.getenv("DATABASE_URL");
        }
        if (dbUrl != null && dbUrl.startsWith("postgres://")) {
            try {
                String cleanUrl = dbUrl.substring("postgres://".length());
                String[] authAndHost = cleanUrl.split("@");
                if (authAndHost.length == 2) {
                    String[] credentials = authAndHost[0].split(":");
                    String[] hostAndDb = authAndHost[1].split("/");
                    
                    String username = credentials[0];
                    String password = credentials.length > 1 ? credentials[1] : "";
                    String hostPort = hostAndDb[0];
                    String dbName = hostAndDb.length > 1 ? hostAndDb[1] : "";
                    
                    System.setProperty("spring.datasource.url", "jdbc:postgresql://" + hostPort + "/" + dbName);
                    System.setProperty("spring.datasource.username", username);
                    System.setProperty("spring.datasource.password", password);
                }
            } catch (Exception e) {
                // Fallback to normal spring properties on parsing error
            }
        }
        SpringApplication.run(BackendApplication.class, args);
    }
}
