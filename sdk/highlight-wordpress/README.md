# Highlight WordPress Plugin

This is a README for developers interested in releasing new versions of the Highlight WordPress plugin.

## Releasing

You'll need to use SVN to push releases to WordPress.org. We've used the `svn` CLI to commit and push to the repo.

Checkout the repo:

```sh
svn checkout https://plugins.svn.wordpress.org/highlight_io/
cd highlight_io
```

Update the files in the repo with the latest code from your local repo:

```sh
cp -r ../path/to/latest/code/* .
```

Commit and push:

```sh
# replace x.x.x with the new version
svn cp trunk tags/x.x.x
svn ci -m "Release version x.x.x"
```

## Resources

* How to Use SVN: https://developer.wordpress.org/plugins/wordpress-org/how-to-use-subversion/#your-account
* SVN Repo: https://plugins.svn.wordpress.org/highlight_io/
* WordPress.org Listing: https://wordpress.org/plugins/highlight-io-session-recording/
* SVN Password: https://profiles.wordpress.org/me/profile/edit/group/3/?screen=svn-password
