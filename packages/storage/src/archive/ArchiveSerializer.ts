// ArchiveSerializer — .sagakeeper.json — TODO: implement
import type { CampaignArchive } from '@saga-keeper/domain'
export interface IArchiveSerializer {
  serialize(archive: CampaignArchive): string
  deserialize(json: string): CampaignArchive
}
