package sites.ezzege.Variables;


import com.google.genai.Client;
import lombok.Getter;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Indexed;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Component
@Indexed
@Scope("singleton")
public class ApiVariables {
    @Getter
    private static String MODEL_NAME = "gemini-3-flash-preview";
    @Getter
    private static Client client;
    private ApiVariables(){try {client = Client.builder().apiKey(Files.readString(Path.of("/Users/mrm/apikey.txt"))).build();} catch (IOException e) {}}
}
