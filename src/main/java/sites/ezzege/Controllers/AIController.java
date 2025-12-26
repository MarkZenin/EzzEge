package sites.ezzege.Controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sites.ezzege.Variables.ApiVariables;
import sites.ezzege.Variables.PromptVariables;

@RestController
@RequestMapping("/ai")
@CrossOrigin(origins = "*")  // Разрешаем запросы с фронтенда
public class AIController {
    private static final Logger logger = LoggerFactory.getLogger(AIController.class);

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody AIRequest request) {
        logger.info("Новый запрос");
        return solveTask(request);
    }
    @PostMapping("/solve_task")
    public static ResponseEntity<?> solveTask(@RequestBody AIRequest request) {
        try {
            String prompt = request.request;
            Integer taskNum = Integer.parseInt(request.taskNum);

            logger.info("[" + taskNum + "] Получена задача с условием: " + prompt.substring(0, Math.min(100, prompt.length())) + "...");

            String aiResponse = AIRequest.solveTaskWithGemini(prompt, PromptVariables.getPrompts().get(taskNum - 1));

            if (aiResponse.startsWith("GEMINI_API_ERROR")) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new AIRequest.ErrorResponse("Ошибка AI сервиса: " + aiResponse));
            }
            return ResponseEntity.ok(new AIRequest.SuccessResponse(true, aiResponse, ApiVariables.getMODEL_NAME()));

        } catch (Exception e) {
            logger.error(e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AIRequest.ErrorResponse("Критическая ошибка сервера: " + e.getMessage()));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Backend is running!");
    }
}