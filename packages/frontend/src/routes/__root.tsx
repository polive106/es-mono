import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

export const Route = createRootRoute({
  component: () => (
    <div>
      <div className="app-container">
        <Outlet />
      </div>
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </div>
  ),
});
