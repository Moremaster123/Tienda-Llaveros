import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from './App';
import { renderWithProviders, sampleProduct, sampleUser } from './test/renderWithProviders';

const readyToPay = {
    auth: { user: sampleUser },
    cart: { items: [{ ...sampleProduct, quantity: 2 }] },
};

const fillAddress = async (user) => {
    await user.type(screen.getByLabelText('Calle y número'), 'Reforma 10');
    await user.type(screen.getByLabelText('Colonia'), 'Centro');
    await user.type(screen.getByLabelText('Código postal'), '72000');
    await user.type(screen.getByLabelText('Ciudad'), 'Puebla');
    await user.type(screen.getByLabelText('Estado'), 'Puebla');
    await user.type(screen.getByLabelText('Teléfono (10 dígitos)'), '2221234567');
};

describe('App', () => {
    it('muestra el catálogo en el inicio', () => {
        renderWithProviders(<App />);

        expect(screen.getByRole('heading', { name: 'Nuestros llaveros' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Sobre ROMXNO' })).toBeInTheDocument();
    });

    it('manda al login si se entra al checkout sin sesión', () => {
        renderWithProviders(<App />, { route: '/checkout' });

        expect(screen.getByRole('heading', { name: 'Ingresar' })).toBeInTheDocument();
        expect(
            screen.getByText('Inicia sesión o crea una cuenta para continuar con tu compra.')
        ).toBeInTheDocument();
    });

    it('no deja confirmar la compra sin guardar el método de pago', async () => {
        const user = userEvent.setup();
        renderWithProviders(<App />, { route: '/checkout', preloadedState: readyToPay });

        await fillAddress(user);
        await user.click(screen.getByRole('button', { name: /Confirmar compra/ }));

        expect(
            screen.getByText('Guarda tu método de pago antes de confirmar la compra.')
        ).toBeInTheDocument();
    });

    it('completa la compra y muestra la confirmación', async () => {
        const user = userEvent.setup();
        const { store } = renderWithProviders(<App />, { route: '/checkout', preloadedState: readyToPay });

        await fillAddress(user);

        await user.type(screen.getByLabelText('Número de tarjeta'), '4242 4242 4242 4242');
        await user.type(screen.getByLabelText('Vencimiento'), '12/28');
        await user.type(screen.getByLabelText('CVV'), '123');
        await user.click(screen.getByRole('button', { name: 'Guardar método de pago' }));

        expect(screen.getByRole('status')).toHaveTextContent(
            'Método de pago guardado: Tarjeta de crédito o débito terminada en 4242'
        );

        await user.click(screen.getByRole('button', { name: /Confirmar compra/ }));

        expect(screen.getByRole('heading', { name: '¡Gracias por tu compra, Ana!' })).toBeInTheDocument();
        expect(screen.getByText('Reforma 10, Centro')).toBeInTheDocument();
        expect(screen.getByText('$257.00')).toBeInTheDocument();
        expect(store.getState().cart.items).toEqual([]);
    });
});
