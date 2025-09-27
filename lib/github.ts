import { Octokit } from '@octokit/rest'

export class GitHubService {
  private octokit: Octokit

  constructor(accessToken: string) {
    this.octokit = new Octokit({
      auth: accessToken,
    })
  }

  async getUser() {
    const { data } = await this.octokit.rest.users.getAuthenticated()
    return data
  }

  async getRepositories() {
    const { data } = await this.octokit.rest.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100,
    })
    return data
  }

  async getRepository(owner: string, repo: string) {
    const { data } = await this.octokit.rest.repos.get({
      owner,
      repo,
    })
    return data
  }

  async getRepositoryContents(owner: string, repo: string, path = '') {
    const { data } = await this.octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    })
    return data
  }

  async getFileContent(owner: string, repo: string, path: string) {
    const { data } = await this.octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    })
    
    if (Array.isArray(data) || data.type !== 'file') {
      throw new Error('Path does not point to a file')
    }
    
    return {
      content: Buffer.from(data.content, 'base64').toString('utf-8'),
      sha: data.sha,
    }
  }

  async createPullRequest(
    owner: string,
    repo: string,
    title: string,
    body: string,
    head: string,
    base = 'main'
  ) {
    const { data } = await this.octokit.rest.pulls.create({
      owner,
      repo,
      title,
      body,
      head,
      base,
    })
    return data
  }

  async createBranch(owner: string, repo: string, branchName: string, baseSha: string) {
    const { data } = await this.octokit.rest.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: baseSha,
    })
    return data
  }

  async updateFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    sha: string,
    branch: string
  ) {
    const { data } = await this.octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: Buffer.from(content).toString('base64'),
      sha,
      branch,
    })
    return data
  }

  async getDefaultBranch(owner: string, repo: string) {
    const { data } = await this.octokit.rest.repos.get({
      owner,
      repo,
    })
    return data.default_branch
  }

  async getLatestCommitSha(owner: string, repo: string, branch?: string) {
    const { data } = await this.octokit.rest.repos.listCommits({
      owner,
      repo,
      sha: branch,
      per_page: 1,
    })
    return data[0].sha
  }
}

