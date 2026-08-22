import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { Garment } from './garment.entity';

@Entity('garment_images')
export class GarmentImage extends BaseEntity {
  @Index()
  @Column({ name: 'garment_id', type: 'uuid' })
  garmentId!: string;

  @ManyToOne(() => Garment, (g) => g.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'garment_id' })
  garment!: Garment;

  @Column({ type: 'text' })
  url!: string;

  @Column({ type: 'int', default: 0 })
  position!: number;
}
