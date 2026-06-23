package com.verideed.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.MapPropertySource;
import java.util.HashMap;
import java.util.Map;

@SpringBootApplication
public class BackendApplication {
    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(BackendApplication.class);
        
        String dbUrl = System.getenv("SPRING_DATASOURCE_URL");
        if (dbUrl == null) {
            dbUrl = System.getenv("DATABASE_URL");
        }
        
        if (dbUrl != null && (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://"))) {
            try {
                String prefix = dbUrl.startsWith("postgres://") ? "postgres://" : "postgresql://";
                String cleanUrl = dbUrl.substring(prefix.length());
                String[] authAndHost = cleanUrl.split("@");
                if (authAndHost.length == 2) {
                    String[] credentials = authAndHost[0].split(":");
                    String[] hostAndDb = authAndHost[1].split("/");
                    
                    String username = credentials[0];
                    String password = credentials.length > 1 ? credentials[1] : "";
                    String hostPort = hostAndDb[0];
                    String dbName = hostAndDb.length > 1 ? hostAndDb[1] : "";
                    
                    String jdbcUrl = "jdbc:postgresql://" + hostPort + "/" + dbName;
                    
                    app.addInitializers((ConfigurableApplicationContext context) -> {
                        Map<String, Object> props = new HashMap<>();
                        props.put("spring.datasource.url", jdbcUrl);
                        props.put("spring.datasource.username", username);
                        props.put("spring.datasource.password", password);
                        
                        context.getEnvironment().getPropertySources().addFirst(
                            new MapPropertySource("railwayUrlOverride", props)
                        );
                    });
                }
            } catch (Exception e) {
                // Fallback to normal spring properties on parsing error
            }
        }
        
        app.run(args);
    }
}
