import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Register from './Register';
import { registerUser } from '../utils/users';
import { renderWithProviders } from '../test/renderWithProviders';

const fillForm = async (user, { password = 'secreto', confirmPassword = 'secreto' } = {}) => {
    await user.type(screen.getByLabelText('Nombre'), 'Ana López');
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@correo.com');
    await user.type(screen.getByLabelText('Contraseña'), password);
    await user.type(screen.getByLabelText('Confirmar contraseña'), confirmPassword);
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
};

describe('Register', () => {
    it('avisa cuando las contraseñas no coinciden', async () => {
        const user = userEvent.setup();
        const { store } = renderWithProviders(<Register />);

        await fillForm(user, { confirmPassword: 'distinta' });

        expect(screen.getByText('Las contraseñas no coinciden.')).toBeInTheDocument();
        expect(store.getState().auth.user).toBeNull();
    });

    it('crea la cuenta e inicia la sesión', async () => {
        const user = userEvent.setup();
        const { store } = renderWithProviders(<Register />);

        await fillForm(user);

        expect(store.getState().auth.user).toEqual({ name: 'Ana López', email: 'ana@correo.com' });
    });

    it('rechaza un correo que ya tiene cuenta', async () => {
        registerUser({ name: 'Ana López', email: 'ana@correo.com', password: 'secreto' });

        const user = userEvent.setup();
        renderWithProviders(<Register />);

        await fillForm(user);

        expect(screen.getByText('Ya existe una cuenta con ese correo.')).toBeInTheDocument();
    });
});
