package sites.ezzege.Variables;

import lombok.Getter;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Indexed;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;

@Scope("singleton")
@Component
@Indexed
public class PromptVariables {
    @Getter
    private static List<String> prompts = new ArrayList<>();
    private static File promptDir = new File("src/Prompts/");
    private PromptVariables(){
        try {
            for (int i = 1; i < 28; i++) {
                prompts.add(Files.readString(promptDir.toPath().resolve(String.valueOf(i))));
            }
        } catch (IOException e) {
        }
    }

    static void main() {
        new PromptVariables();
    }
}
