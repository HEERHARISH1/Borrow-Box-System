import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.AnchorPane;
import javafx.stage.Stage;

public class CreateAccountPage extends Application {

    @Override
    public void start(Stage primaryStage) {
        // Create the root layout (AnchorPane)
        AnchorPane root = new AnchorPane();
        root.setPrefSize(600, 400);

        // Set background using UIHelper
        UIHelper.setBackground(root, "file:src/bg.jpg");

        // Title Label ("Create Account")
        Label titleLabel = new Label("Create Account");
        titleLabel.setFont(UIHelper.getTitleFont());
        titleLabel.setLayoutX(170.0);
        titleLabel.setLayoutY(40.0);

        // Username Label and TextField
        Label usernameLabel = new Label("Name:");
        usernameLabel.setFont(UIHelper.getLabelFont());
        usernameLabel.setLayoutX(120.0);
        usernameLabel.setLayoutY(120.0);

        TextField usernameField = new TextField();
        usernameField.setPromptText("Enter your name");
        usernameField.setLayoutX(220.0);
        usernameField.setLayoutY(120.0);

        // Email Label and TextField
        Label emailLabel = new Label("Email:");
        emailLabel.setFont(UIHelper.getLabelFont());
        emailLabel.setLayoutX(120.0);
        emailLabel.setLayoutY(160.0);

        TextField emailField = new TextField();
        emailField.setPromptText("Enter your email");
        emailField.setLayoutX(220.0);
        emailField.setLayoutY(160.0);

        // Password Label and PasswordField
        Label passwordLabel = new Label("Password:");
        passwordLabel.setFont(UIHelper.getLabelFont());
        passwordLabel.setLayoutX(120.0);
        passwordLabel.setLayoutY(200.0);

        PasswordField passwordField = new PasswordField();
        passwordField.setPromptText("Enter your password");
        passwordField.setLayoutX(220.0);
        passwordField.setLayoutY(200.0);

        // Confirm Password Label and PasswordField
        Label confirmPasswordLabel = new Label("Re-enter Password:");
        confirmPasswordLabel.setFont(UIHelper.getLabelFont());
        confirmPasswordLabel.setLayoutX(80.0);
        confirmPasswordLabel.setLayoutY(240.0);

        PasswordField confirmPasswordField = new PasswordField();
        confirmPasswordField.setPromptText("Re-enter your password");
        confirmPasswordField.setLayoutX(220.0);
        confirmPasswordField.setLayoutY(240.0);

        // Register Button
        Button registerButton = UIHelper.createStyledButton("Register");
        registerButton.setLayoutX(250.0);
        registerButton.setLayoutY(300.0);

        // Back Button
        Button backButton = UIHelper.createBackButton(primaryStage, new LoginPage());
        backButton.setLayoutX(50.0);
        backButton.setLayoutY(300.0);

        // Message Label for Feedback
        Label messageLabel = new Label();
        messageLabel.setLayoutX(220.0);
        messageLabel.setLayoutY(340.0);
        messageLabel.setStyle("-fx-text-fill: red;");

        // Register button action
        registerButton.setOnAction(e -> {
            String username = usernameField.getText();
            String email = emailField.getText();
            String password = passwordField.getText();
            String confirmPassword = confirmPasswordField.getText();

            // Validate fields
            if (username.isEmpty() || email.isEmpty() || password.isEmpty() || confirmPassword.isEmpty()) {
                messageLabel.setText("All fields are required.");
                return;
            }

            // Check if passwords match
            if (!password.equals(confirmPassword)) {
                messageLabel.setText("Passwords do not match. Please re-enter.");
                return;
            }

            // Prevent Admin account creation from this page
            if ("admin".equalsIgnoreCase(username)) {
                messageLabel.setText("Cannot create Admin accounts here.");
                return;
            }

            // Register the user using the UserService
            UserService userService = new UserService();
            boolean success = userService.registerUser(username, email, password, "USER");

            if (success) {
                messageLabel.setStyle("-fx-text-fill: green;");
                messageLabel.setText("Account created successfully!");
                // Redirect back to login page
                new LoginPage().start(primaryStage);
            } else {
                messageLabel.setText("Failed to create account. Try again.");
            }
        });

        // Add all UI elements to the root layout
        root.getChildren().addAll(
                titleLabel, usernameLabel, usernameField,
                emailLabel, emailField,
                passwordLabel, passwordField,
                confirmPasswordLabel, confirmPasswordField,
                registerButton, backButton, messageLabel
        );

        // Create the scene and set it on the stage
        Scene scene = new Scene(root);
        primaryStage.setTitle("Create Account");
        primaryStage.setScene(scene);
        primaryStage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
