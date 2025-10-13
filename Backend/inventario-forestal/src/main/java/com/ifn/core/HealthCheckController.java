package com.ifn.core;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthCheckController {

    @GetMapping("/api/health")
    public Map<String, Object> healthCheck() {
        Map<String, Object> healthInfo = new HashMap<>();
        healthInfo.put("status", "UP");
        healthInfo.put("timestamp", LocalDateTime.now().toString());
        healthInfo.put("service", "Inventario Forestal Nacional");
        healthInfo.put("version", "1.0.0");
        return healthInfo;
    }

    @GetMapping("/api/test")
    public String test() {
        return "¡El servidor está funcionando! 🎉";
    }
}