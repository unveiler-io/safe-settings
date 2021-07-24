module.exports = class Repository {
  constructor (github, repo, settings, installationId, log) {
    this.installationId = installationId
    this.github = github
    this.settings = Object.assign({ mediaType: { previews: ['baptiste'] } }, settings, repo)
    this.topics = this.settings.topics
    this.repo = repo
    this.log = log
    delete this.settings.topics
  }

  sync () {
    this.settings.name = this.settings.name || this.settings.repo
    this.log(`Syncing Repo ${this.settings.name}`)
    return this.github.repos.get(this.repo).then(() => {
      return this.updaterepo()
    }).catch(e => {
      if (e.status === 404) {
        this.log(`Creating repo with settings ${this.settings}`)
        return this.github.repos.createInOrg(this.settings).then(newrepo => {
          return this.updaterepo()
        })
      } else {
        this.log(`Unexpected error while getting repo info ${e}`)
      }
    })
  }

  updaterepo () {
    this.log(`Updating repo with settings ${JSON.stringify(this.settings)}`)
    return this.github.repos.update(this.settings).then(() => {
      if (this.topics) {
        this.log(`Updating repo with topics "${this.topics}"`)
        return this.github.repos.replaceAllTopics({
          owner: this.settings.owner,
          repo: this.settings.repo,
          names: this.topics.split(/\s*,\s*/),
          mediaType: {
            previews: ['mercy']
          }
        })
        .then(() => this.log("Updated topics"))
        .catch(e => {
          this.log(`Failed updating labels for ${this.repo.name} with error ${e}`)
        })  
      }
    }).catch(e => {
      this.log(`Failed updating repo ${this.repo.name} with error ${e}`)
    })
  }
}
