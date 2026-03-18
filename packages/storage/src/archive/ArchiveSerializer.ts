import type { CampaignArchive } from '@saga-keeper/domain'

export interface IArchiveSerializer {
  serialize(archive: CampaignArchive): string
  deserialize(json: string): CampaignArchive
}

export class ArchiveSerializer implements IArchiveSerializer {
  serialize(archive: CampaignArchive): string {
    return JSON.stringify(archive, null, 2)
  }

  deserialize(json: string): CampaignArchive {
    let parsed: unknown
    try {
      parsed = JSON.parse(json)
    } catch {
      throw new Error('Invalid archive: could not parse JSON')
    }
    const archive = parsed as CampaignArchive
    if (archive.version !== '1') {
      throw new Error(`Unsupported archive version: "${archive.version}"`)
    }
    return archive
  }
}
