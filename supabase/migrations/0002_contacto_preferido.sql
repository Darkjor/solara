-- Canal por el que el prospecto prefiere que lo contacten (formulario del hero).
alter table public.leads
  add column contacto_preferido text
  check (contacto_preferido is null or contacto_preferido in ('whatsapp','llamada','correo'));
