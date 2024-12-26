import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class HeaderComponent extends NavigationMixin(LightningElement) {



     handleLogIn() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/login'
            }
        });
    }

    handleRegistration() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/SelfRegister'
            }
        });
    }


}