import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.AnchorPane;
import javafx.stage.Stage;

public class LoginPage extends Application {

    @Override
    public void start(Stage primaryStage) {
        // Create the root layout (AnchorPane)
        AnchorPane root = new AnchorPane();
        root.setPrefSize(600, 400);

        // Set background using UIHelper
        UIHelper.setBackground(root, "file:src/bg.jpg");

        // Title Label ("Borrow Box")
        Label titleLabel = new Label("Borrow Box");
        titleLabel.setFont(UIHelper.getTitleFont());
        titleLabel.setLayoutX(200.0);
        titleLabel.setLayoutY(50.0);

        // Name Label and TextField
        Label nameLabel = new Label("Username");
        nameLabel.setFont(UIHelper.getLabelFont());
        nameLabel.setLayoutX(150.0);
        nameLabel.setLayoutY(150.0);

        TextField usernameField = new TextField();
        usernameField.setPromptText("Enter your username");
        usernameField.setLayoutX(220.0);
        usernameField.setLayoutY(150.0);

        // Password Label and PasswordField
        Label passwordLabel = new Label("Password");
        passwordLabel.setFont(UIHelper.getLabelFont());
        passwordLabel.setLayoutX(150.0);
        passwordLabel.setLayoutY(200.0);

        PasswordField passwordField = new PasswordField();
        passwordField.setPromptText("Enter your password");
        passwordField.setLayoutX(220.0);
        passwordField.setLayoutY(200.0);

        // Login Button
        Button loginButton = UIHelper.createStyledButton("Login");
        loginButton.setLayoutX(250.0);
        loginButton.setLayoutY(250.0);

        // Create Account Button
        Button createAccountButton = UIHelper.createStyledButton("Create Account");
        createAccountButton.setLayoutX(400.0);
        createAccountButton.setLayoutY(300.0);

        // Message Label (for login feedback)
        Label messageLabel = new Label();
        messageLabel.setLayoutX(200.0);
        messageLabel.setLayoutY(300.0);
        messageLabel.setStyle("-fx-text-fill: red;"); // Red text for errors

        // Add Login Button Action
        loginButton.setOnAction(e -> {
            String username = usernameField.getText();
            String password = passwordField.getText();

            if (username.isEmpty() || password.isEmpty()) {
                messageLabel.setText("Please fill in all details.");
                return;
            }

            UserService userService = new UserService();
            int userId = userService.getUserId(username, password); // Fetch userId dynamically
            String role = userService.getUserRole(username);

            if (role == null || userId == -1) {
                messageLabel.setText("Invalid credentials. Please try again.");
            } else if ("ADMIN".equalsIgnoreCase(role)) {
                Admin admin = Admin.getInstance(username, password);
                if (admin.validatePassword(password)) {
                    AdminDashboard adminDashboard = new AdminDashboard();
                    adminDashboard.start(primaryStage);
                } else {
                    messageLabel.setText("Invalid Admin credentials.");
                }
            } else {
                boolean isValid = userService.validateLogin(username, password);
                if (isValid) {
                    ModeSelectionPage modeSelectionPage = new ModeSelectionPage(username, userId); // Pass userId to next page
                    modeSelectionPage.start(primaryStage);
                } else {
                    messageLabel.setText("Invalid credentials. Please try again.");
                }
            }
        });

        // Create Account Button Action
        createAccountButton.setOnAction(e -> {
            CreateAccountPage createAccountPage = new CreateAccountPage();
            createAccountPage.start(primaryStage);
        });

        // Add all UI elements to the root layout
        root.getChildren().addAll(titleLabel, nameLabel, usernameField, passwordLabel, passwordField, loginButton, createAccountButton, messageLabel);

        // Set up the scene
        Scene scene = new Scene(root);
        primaryStage.setTitle("Login Page");
        primaryStage.setScene(scene);
        primaryStage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
