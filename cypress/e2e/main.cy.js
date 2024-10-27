describe('Login Test', () => {
    it('Logs in with valid credentials', () => {
        cy.intercept('POST', 'https://api.semabet.ug/id/Verification/login').as('loginRequest');

        cy.visit('/');

        cy.contains('button', 'Login').click();

        cy.get('input[name="phoneNumberField"]').type('777785468');
        cy.get('#passwordField').type('Hello1234');
        cy.get('button[type="submit"]').contains('Login').click();

        cy.wait('@loginRequest').then((interception) => {
            expect(interception.request.body).to.have.property('password', 'Hello1234');
            expect(interception.request.body).to.have.property('phoneNumber', '+256777785468');
            expect(interception.response.statusCode).to.eq(200);
            expect(interception.response.body).to.have.property('token').and.not.be.empty;

            cy.contains('button', 'Deposit').should('exist');
        })
    })

    it('Fails to log in with invalid credentials', () => {
        cy.intercept('POST', 'https://api.semabet.ug/id/Verification/login').as('loginRequest');

        cy.visit('/');

        cy.contains('button', 'Login').click();

        cy.get('input[name="phoneNumberField"]').type('777785468');
        cy.get('#passwordField').type('WrongPassword123');
        cy.get('button[type="submit"]').contains('Login').click();

        cy.wait('@loginRequest').then((interception) => {
            expect(interception.request.body).to.have.property('password', 'WrongPassword123');
            expect(interception.request.body).to.have.property('phoneNumber', '+256777785468');
            expect(interception.response.statusCode).to.eq(400);

            cy.contains('Invalid login or password!').should('be.visible');
        });
    });
})

describe('Forgot Password', () => {
    it('Verify SMS is Sent for Forgot Password Request', () => {
        cy.intercept('POST', 'https://api.semabet.ug/id/Verification/getresetpasswordcode').as('resetPasswordRequest');

        cy.visit('/');

        cy.contains('button', 'Login').click();

        cy.contains('p', 'Forgot Password?').click();

        cy.get('#phoneNumberField').type('777785468');

        cy.contains('button', 'Reset').click();

        cy.wait('@resetPasswordRequest').then((interception) => {
            expect(interception.request.body).to.have.property('phoneNumber', '+256777785468');
            expect(interception.response.statusCode).to.eq(200);

            cy.contains('p', 'Check your phone please').should('be.visible');
        });
    });

    it('Verify Forgot Password with invalid phone number', () => {
        cy.intercept('POST', 'https://api.semabet.ug/id/Verification/getresetpasswordcode').as('resetPasswordRequest');

        cy.visit('/');

        cy.contains('button', 'Login').click();

        cy.contains('p', 'Forgot Password?').click();

        cy.get('#phoneNumberField').type('7777854');

        cy.contains('button', 'Reset').click();

        cy.wait('@resetPasswordRequest').then((interception) => {
            expect(interception.response.statusCode).to.eq(404);

            cy.contains('Invalid phone number!').should('be.visible');
        });
    });
});

describe('Reseting Password from User Profile', () => {
    it('Verify successful Password Reset from User profile', () => {
        cy.intercept('POST', 'https://api.semabet.ug/id/User/changePassword').as('changePasswordRequest');
        cy.visit('/');
        cy.contains('button', 'Login').click();

        cy.get('input[name="phoneNumberField"]').type('777785468');
        cy.get('#passwordField').type('Hello1234');
        cy.get('button[type="submit"]').contains('Login').click();

        cy.get('.c-eUnNbb').click();

        cy.contains('p', 'Personal Profile').click();
        cy.contains('button', 'Account settings').click();
        cy.get('#currentPassword').type('Hello1234');
        cy.get('#newPassword').type('NewPass');
        cy.contains('button', 'Change password').click();
        cy.wait('@changePasswordRequest').then((interception) => {
            expect(interception.response.statusCode).to.eq(200);

            cy.get('#currentPassword').type('NewPass');
            cy.get('#newPassword').type('Hello1234');
            cy.contains('button', 'Change password').click();
        });
        cy.wait('@changePasswordRequest').then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
        });
    });
});

describe('Logout', () => {
    it('Verify Logout from Personal Profile pop up', () => {
        cy.visit('/');
        cy.contains('button', 'Login').click();

        cy.get('input[name="phoneNumberField"]').type('777785468');
        cy.get('#passwordField').type('Hello1234');
        cy.get('button[type="submit"]').contains('Login').click();

        cy.get('.c-eUnNbb').click();

        cy.contains('p', 'Personal Profile').click();
        cy.contains('button', 'Logout').click();
        cy.contains('button', 'Login').should('be.visible');
    });

    it('Verify Logout from User pop up', () => {
        cy.visit('/');
        cy.contains('button', 'Login').click();

        cy.get('input[name="phoneNumberField"]').type('777785468');
        cy.get('#passwordField').type('Hello1234');
        cy.get('button[type="submit"]').contains('Login').click();

        cy.get('.c-eUnNbb').click();

        cy.contains('p', 'Logout').click();
        cy.contains('button', 'Login').should('be.visible');
    });
});

describe('Registration flow', () => {
    it('Verify Registration with invalid number', () => {
        cy.visit('/');
        cy.contains('button', 'Register').click();

        cy.get('#phoneNumberField').type('75554566');
        cy.get('#passwordField').type('Pass1234');
        cy.contains('button', 'Next').click({ force: true });
        cy.contains('p', 'invalidPhoneNumber').should('be.visible');
    });

    it('Verify Registration with already existing number', () => {
        cy.visit('/');
        cy.contains('button', 'Register').click();

        cy.get('#phoneNumberField').type('777785468');
        cy.get('#passwordField').type('Pass1234');
        cy.contains('button', 'Next').click({ force: true });
        cy.contains('p', 'This phone number already exists!').should('be.visible');
    });

    // Skipping for not sending SMS to real number
    it.skip('Verify Registration with real number', () => {
        cy.visit('/');
        cy.contains('button', 'Register').click();

        cy.get('#phoneNumberField').type('777785469'); // replace this number with your real number
        cy.get('#passwordField').type('Pass1234');
        cy.contains('button', 'Next').click({ force: true });
        cy.contains('p', 'Check your phone please').should('be.visible');
    });
});
