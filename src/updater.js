const fs = require('fs')
const path = require('path')
const https = require('https')
const semver = require('semver')
const { env } = require('process')
const { remote } = require('electron')
const { exec } = require('child_process');

// https://api.github.com/repos/ObnoxiousOliver/auto-update-test/releases

checkForUpdatesAndInstall ({
  gitUser: 'ObnoxiousOliver',
  gitRepo: 'auto-update-test'
}, ({ state }) => {
  document.getElementById('download-label').textContent = state
})


// options: {
//   gitUser: String,
//   gitRepo: String
// }
function checkForUpdatesAndInstall (options, callback) {
  callback({ state: 'Checking for Updates...' })
  fetch(`https://api.github.com/repos/${options.gitUser}/${options.gitRepo}/releases`)
    .then(res => res.json())
    .then(data => {
      // Get Latest Version
      const release = data.filter(x => semver.satisfies(x.tag_name, `> ${remote.app.getVersion()}`))[0]
      if (release) {
        const asset = release.assets.filter(x => x.name.endsWith('.exe'))[0]

        if (asset) {
          const dest = path.join(env.TEMP, asset.name)

          // Fetch installer file
          callback({ state: 'Downloading (' + release.tag_name + ')...' })
          fetch(asset.browser_download_url)
            .then(res => res.arrayBuffer())
            .then(data => {
              callback({ state: 'Installing...' })

              // Write File and open it
              fs.writeFileSync(dest, Buffer.from(data))
              exec(dest)
              setTimeout(remote.app.quit, 1000)
              return
            })
        } else {
          callback({ state: 'Latest Version Installed...' })
        }
      } else {
        callback({ state: 'Latest Version Installed...' })
      }
    })
}
