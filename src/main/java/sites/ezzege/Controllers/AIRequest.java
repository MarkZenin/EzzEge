package sites.ezzege.Controllers;

import com.google.genai.types.Content;
import com.google.genai.types.Part;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import sites.ezzege.Variables.ApiVariables;

@Service
public class AIRequest {
    protected String taskNum;
    protected String request;

    private static final Logger logger = LoggerFactory.getLogger(AIRequest.class);

    public AIRequest(){}

    protected static String solveTaskWithGemini(String prompt, String systemPrompt) {
        logger.info("Solving task with Gemini-3-flash");
        try {
            GenerateContentConfig config = GenerateContentConfig.builder().systemInstruction(Content.fromParts(Part.builder().text(systemPrompt).build())).temperature(0.1f).build();

            GenerateContentResponse response = ApiVariables.getClient().models.generateContent(ApiVariables.getMODEL_NAME(), prompt, config);

            return response.text();

        } catch (Exception e) {
            logger.error(e.getMessage(), e);
            return "GEMINI_API_ERROR: " + e.getMessage();
        }
    }

    public static class SuccessResponse {
        private boolean success;
        private String result;
        private String model;

        public SuccessResponse(boolean success, String result, String model) {
            this.success = success;
            this.result = result;
            this.model = model;
        }

        public boolean isSuccess() {
            return success;
        }

        public String getResult() {
            return result;
        }

        public String getModel() {
            return model;
        }
    }

    public static class ErrorResponse {
        private String error;

        public ErrorResponse(String error) {
            this.error = error;
        }

        public String getError() {
            return error;
        }
    }

    public void setRequest(String request) {
        this.request = request;
    }

    public void setTaskNum(String taskNum) {
        this.taskNum = taskNum;
    }

    public String getRequest() {
        return request;
    }

    public String getTaskNum() {
        return taskNum;
    }
}
