# Creating a GitHub App

You will need to create and register a GitHub App under your personal account or under any organization you have administrative access to.

> _Learn more about [creating GitHub Apps][creating-a-github-app]._

##### Org vs. Personal

Depending on your usage, your entry point for creating a GitHub app will differ:

- **Personal Accounts**: `https://github.com/settings/apps/new`
- **GitHub Accounts** `https://github.com/organizations/[your-org-name]/settings/apps/new`

<!-- TODO: add GitHub Enterprise Option -->

You'll be asked provide details for the app, here are the **required** values:

#### GitHub App name

Can be anything, suggest using `org-dependencies` + `you-org-name` as a suffix

> _e.g. `my-company-org-dependencies`_

#### Homepage URL

Set to `https://dependencies.org`

#### User authorization callback URL

The full URL to redirect to after a user authorizes an installation.

Use `https://your-app-domain` + `/auth/callback`

> _e.g. `https://dependencies.my-company.com/auth/callback`_   
> _local development: `localhost:3000/auth/callback`_

- **Related Environment Variable**: [`DEPENDENCIES_APP_LINK`](./environment.md#DEPENDENCIES_APP_LINK)

#### Webhook URL

Events will `POST` to this URL.

Use the root url of the app `https://your-app-domain`

> _e.g. `https://dependencies.my-company.com/`_

- **Related Environment Variable**: [`DEPENDENCIES_APP_LINK`](./environment.md#DEPENDENCIES_APP_LINK)

##### Webhook secret _(optional)_

While optional, this is recommended to ensure your Dependencies App data is secure from external manipulation

> _e.g. `oopee2Ie-Noethoh0-eoS6xah4-yeemeu9U`_

- **Related Environment Variable**: [`GITHUB_WEBHOOK_SECRET`](./environment.md#GITHUB_WEBHOOK_SECRET)

## Permissions

#### Repository contents [ℹ️][permission-on-contents]

Repository contents, commits, branches, downloads, releases, and merges.

Access: **`Read-only`**

#### Repository metadata [ℹ️][metadata-permissions]

Access: **`Read-only`**

#### Organization members [ℹ️][permission-on-members]

Access: **`Read-only`**

## Events

> _**Note**: you'll have to set all the permissions above first, to enable all the events needed below_

#### Create [ℹ️][createevent]

Branch or tag created.

#### Delete [ℹ️][deleteevent]

Branch or tag deleted.

#### Push [ℹ️][deleteevent]

Git push to a repository.

#### Repository [ℹ️][repositoryevent]

Repository created, deleted, archived, unarchived, publicized, or privatized.

## Where can this GitHub App be installed?

If you're forking for the purpose of using this for your self, or your organization, you should pick **"Only on this account"**.

> _**Note**: We provide a hosted public service at [https://dependencies.org](https://dependencies.org)_

## Generated App Information _(Keys & Secrets)_

Once created, GitHub will generate a few key items you'll need to pass to Dependencies App:

| name          | environment variable                                              |
| ------------- | ----------------------------------------------------------------- |
| App ID        | [`GITHUB_APP_ID`](./environment.md#GITHUB_APP_ID)                |
| Client ID     | [`GITHUB_CLIENT_ID`](./environment.md#GITHUB_CLIENT_ID)          |
| Client secret | [`GITHUB_CLIENT_SECRET`](./environment.md#GITHUB_CLIENT_SECRET)  |
| Public link   | [`GITHUB_APP_LINK`](./environment.md#GITHUB_APP_LINK)            |

### Generating a Private key

You need a private key to sign access token requests to GitHub.

Click _"Generate Private Key"_ and store the downloaded `.pem` file somewhere safe. You'll need to [use this for the app environment configuration](./environment.md#GITHUB_PRIVATE_KEY)

[creating-a-github-app]: https://developer.github.com/apps/building-github-apps/creating-a-github-app/ 
[creating-github-apps-from-a-manifest]: https://developer.github.com/apps/building-github-apps/creating-github-apps-from-a-manifest/

[pushevent]: https://developer.github.com/v3/activity/events/types/#pushevent
[createevent]: https://developer.github.com/v3/activity/events/types/#createevent
[deleteevent]: https://developer.github.com/v3/activity/events/types/#deleteevent
[repositoryevent]: https://developer.github.com/v3/activity/events/types/#repositoryevent

[permission-on-contents]: https://developer.github.com/v3/apps/permissions/#permission-on-contents
[metadata-permissions]: https://developer.github.com/v3/apps/permissions/#metadata-permissions
[permission-on-members]: https://developer.github.com/v3/apps/permissions/#permission-on-members
