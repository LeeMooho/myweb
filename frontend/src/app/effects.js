import i18n from '../i18n';
import { tokenStorage } from '../shared/api/tokenStorage';

export const browserEffects = {
    notify: message => window.alert(i18n.t(message)),
    redirect: path => window.location.assign(path),
    session: tokenStorage
};
