# JumpingKat

Landing y agenda para clases personalizadas de jumping. Publicas las clases con cupo, el calendario las muestra y cada registro ocupa un lugar. Si el cupo se llena, la clase se cierra. Para apartar hay que enviar el Zelle y elegir el sabor de proteína.

## Arranque

```bash
npm install
npm run dev
```

- Sitio: http://localhost:5173
- Panel: http://localhost:5173/admin
- La clave del panel está en `server/.env` (`ADMIN_PASSWORD`)

En el panel, publica cada clase con fecha, hora y cupo. También completa el nombre, el destino de Zelle, el monto y el lugar. Esos datos aparecen en la agenda.

## Estados

- **Apartado:** la persona envió el Zelle y eligió su proteína. Falta que tú veas el depósito.
- **Pagado:** tú confirmaste que el dinero llegó.
- **Pendiente:** solo si tú devuelves un registro a ese estado. La agenda ya no deja apartar sin pago.

Borrar un registro libera el lugar. Zelle no se cobra dentro de la página: la persona envía el pago y tú lo confirmas.

Puedes filtrar, cambiar el estado y descargar un CSV.

## Producción

```bash
npm start
```

Eso compila el sitio y lo sirve junto con la API.
