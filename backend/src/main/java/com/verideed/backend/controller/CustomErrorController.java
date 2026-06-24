package com.verideed.backend.controller;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import java.util.Map;

@Controller
public class CustomErrorController implements ErrorController {

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @RequestMapping("/error")
    public Object handleError(HttpServletRequest request) {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        Object requestUri = request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);
        
        String uri = requestUri != null ? requestUri.toString() : "";
        
        // Return JSON error response for all API requests
        if (uri.startsWith("/api")) {
            HttpStatus httpStatus = HttpStatus.NOT_FOUND;
            if (status != null) {
                try {
                    int statusCode = Integer.parseInt(status.toString());
                    httpStatus = HttpStatus.valueOf(statusCode);
                } catch (Exception e) {
                    // fallback
                }
            }
            return new ResponseEntity<>(Map.of(
                "error", "Resource not found",
                "status", httpStatus.value(),
                "path", uri
            ), httpStatus);
        }
        
        // Redirect browser visits to the React frontend
        return "redirect:" + frontendUrl;
    }
}
