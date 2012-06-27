module Bootsy
  class Image < ActiveRecord::Base
    belongs_to :bootsy_imageable, :polymorphic => true

    mount_uploader :image_file, ImageUploader

    attr_accessible :image_file

    validates_presence_of :image_file
  end
end