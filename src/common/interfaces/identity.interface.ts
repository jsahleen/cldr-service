export interface IVersions {
  cldr: string
  unicode?: string
}

export interface IIdentity {
  language: string
  script?: string
  territory?: string
  variant?: string
  versions: IVersions
}