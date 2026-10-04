import { describe, expect, it } from 'vitest';

import { registerUser, authenticate, saveSession, loadSession, clearSession } from './users';

const newUser = { name: ' Ana López ', email: 'ANA@correo.com ', password: 'secreto' };

describe('users', () => {
    it('registra un usuario y no expone su contraseña', () => {
        const result = registerUser(newUser);

        expect(result).toEqual({ ok: true, user: { name: 'Ana López', email: 'ana@correo.com' } });
    });

    it('rechaza un correo ya registrado', () => {
        registerUser(newUser);

        expect(registerUser(newUser)).toEqual({
            ok: false,
            error: 'Ya existe una cuenta con ese correo.',
        });
    });

    it('autentica solo con la contraseña correcta', () => {
        registerUser(newUser);

        expect(authenticate('ana@correo.com', 'secreto')).toEqual({
            name: 'Ana López',
            email: 'ana@correo.com',
        });
        expect(authenticate('ana@correo.com', 'incorrecta')).toBeNull();
    });

    it('guarda y limpia la sesión', () => {
        saveSession({ name: 'Ana López', email: 'ana@correo.com' });
        expect(loadSession()).toEqual({ name: 'Ana López', email: 'ana@correo.com' });

        clearSession();
        expect(loadSession()).toBeNull();
    });
});
