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
    return JSON.parse(json) as CampaignArchive
  }
}
