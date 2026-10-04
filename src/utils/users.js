const USERS_KEY = 'romxno_users';
const SESSION_KEY = 'romxno_session';

const read = (key, fallback) => {
    try {
        const raw = localStorage.getItem(key);

        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
};

const write = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Sin almacenamiento disponible: la tienda sigue funcionando en memoria
    }
};

const normalizeEmail = (email) => email.trim().toLowerCase();

const publicUser = ({ name, email }) => ({ name, email });

export const getUsers = () => {
    const users = read(USERS_KEY, []);

    return Array.isArray(users) ? users : [];
};

export const registerUser = ({ name, email, password }) => {
    const users = getUsers();
    const cleanEmail = normalizeEmail(email);

    if (users.some((user) => user.email === cleanEmail)) {
        return { ok: false, error: 'Ya existe una cuenta con ese correo.' };
    }

    // Simulación escolar: en una app real la contraseña se cifra en el servidor
    const newUser = { name: name.trim(), email: cleanEmail, password };

    write(USERS_KEY, [...users, newUser]);

    return { ok: true, user: publicUser(newUser) };
};

export const authenticate = (email, password) => {
    const cleanEmail = normalizeEmail(email);

    const found = getUsers().find(
        (user) => user.email === cleanEmail && user.password === password
    );

    return found ? publicUser(found) : null;
};

export const loadSession = () => {
    const session = read(SESSION_KEY, null);

    return session && session.email ? session : null;
};

export const saveSession = (user) => write(SESSION_KEY, user);

export const clearSession = () => {
    try {
        localStorage.removeItem(SESSION_KEY);
    } catch {
        // Nada que limpiar
    }
};
