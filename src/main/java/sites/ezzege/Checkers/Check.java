package sites.ezzege.Checkers;

import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@Component
@Scope("singleton")
public class Check {
    protected static boolean LegitRequest(String request) {
        return true;
    }
}
