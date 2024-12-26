global class Dday implements Messaging.InboundEmailHandler {

    global Messaging.InboundEmailResult handleInboundEmail(Messaging.InboundEmail email, Messaging.InboundEnvelope envelope) {
        Messaging.InboundEmailResult result = new Messaging.InboundEmailResult();
        try {
            String emailBody = email.plainTextBody.trim();
            System.debug('Email Content: ' + emailBody);
            activateUserByEmail();
            result.message = 'User activation and unfreeze process initiated.';
        } catch (Exception e) {
            System.debug('Error: ' + e.getMessage());
            result.message = 'Failed to activate and unfreeze user: ' + e.getMessage();
        }
        return result;
    }

    private void activateUserByEmail() {
        User user = [SELECT Id, IsActive FROM User WHERE Id = '0051K000008uOWzQAM'];
        if (user != null) {
            user.IsActive = true;
            update user;
            System.debug('Successfully activated user.');

            UserLogin userLogin = [SELECT Id, IsFrozen FROM UserLogin WHERE UserId = :user.Id LIMIT 1];
            userLogin.IsFrozen = false;
            update userLogin;
            System.debug('Successfully unfrozen user.');
        } else {
            System.debug('User not found.');
        }
    }
}