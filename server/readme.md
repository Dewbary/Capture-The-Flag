# Capture The Flag

## Client

- navigate to `client` directory
  `pnpm dev`

## Server

- navigate to `server` directory
  `npm run server`

## Deploying

- deployed on Heroku
- build the client, copy the contents of the `dist` directory over to the `public` directory of the server, then run:
  `git push heroku main`

## TODO

- Improve State management (eliminate duplication)
  - Collision management
    - manage it on the server
- Each team should have a prison area
  - When tagged in the opposing color, the opposing color should be transported to the prison area
- Update spawn points for each team
- Upgrade Map
- Upgrade Movement
- automate the build process
- add sentries
