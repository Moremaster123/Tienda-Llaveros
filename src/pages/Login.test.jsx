import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Login from './Login';
import { registerUser } from '../utils/users';
import { renderWithProviders } from '../test/renderWithProviders';

describe('Login', () => {
    it('muestra los errores al enviar el formulario vacío', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Login />);

        await user.click(screen.getByRole('button', { name: 'Ingresar' }));

        expect(screen.getByText('Escribe tu correo electrónico.')).toBeInTheDocument();
        expect(screen.getByText('Escribe tu contraseña.')).toBeInTheDocument();
    });

    it('avisa cuando las credenciales son incorrectas', async () => {
        const user = userEvent.setup();
        const { store } = renderWithProviders(<Login />);

        await user.type(screen.getByLabelText('Correo electrónico'), 'ana@correo.com');
        await user.type(screen.getByLabelText('Contraseña'), 'incorrecta');
        await user.click(screen.getByRole('button', { name: 'Ingresar' }));

        expect(screen.getByText('Correo o contraseña incorrectos.')).toBeInTheDocument();
        expect(store.getState().auth.user).toBeNull();
    });

    it('inicia sesión con una cuenta registrada', async () => {
        registerUser({ name: 'Ana López', email: 'ana@correo.com', password: 'secreto' });

        const user = userEvent.setup();
        const { store } = renderWithProviders(<Login />);

        await user.type(screen.getByLabelText('Correo electrónico'), 'ana@correo.com');
        await user.type(screen.getByLabelText('Contraseña'), 'secreto');
        await user.click(screen.getByRole('button', { name: 'Ingresar' }));

        expect(store.getState().auth.user).toEqual({ name: 'Ana López', email: 'ana@correo.com' });
    });

    it('muestra el aviso cuando se llega desde el checkout', () => {
        renderWithProviders(<Login />, { route: { pathname: '/login', state: { from: '/checkout' } } });

        expect(
            screen.getByText('Inicia sesión o crea una cuenta para continuar con tu compra.')
        ).toBeInTheDocument();
    });
});
