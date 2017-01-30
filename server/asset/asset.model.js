'use strict';

const Serializer = require('sequelize-to-json');
const database = require('../shared/database');

const ASSET_COLLECTION = database.collection.ASSET;

/**
 * @swagger
 * definitions:
 *   Asset:
 *     type: object
 *     required:
 *     - courseKey
 *     - activityKey
 *     - layoutWidth
 *     - position
 *     - type
 *     properties:
 *       courseId:
 *         type: integer
 *         description: course owning the asset
 *       activityId:
 *         type: integer
 *         description: activity owning the asset
 *       layoutWidth:
 *         type: integer
 *         description: width of the layout column containing the asset
 *       position:
 *         type: float
 *         description: position within the array of other assets
 *       type:
 *         type: string
 *         description: asset type
 *         enum:
 *         - TEXT
 *         - IMAGE
 *         - VIDEO
 *       content:
 *         type: string
 *         description: text content entered by user; required for TEXT assets
 *       url:
 *         type: string
 *         description: URL of image or video; required for IMAGE and VIDEO assets
 */

module.exports = function(sequelize, DataTypes) {
  const Asset = sequelize.define(ASSET_COLLECTION, {
    layout_width: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    position: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: 1, max: 12 }
    },
    type: {
      type: DataTypes.ENUM,
      values: ['TEXT', 'IMAGE', 'VIDEO'],
      allowNull: false
    },
    data: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: { notEmpty: true }
    },
    // TODO(marko): Temp solutions.
    activity_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    classMethods: {
      deleteById(id) {
        // Wrap instance delete method into class method
        // for easier chaining.
        return this
        .findById(id)
        .then(result => {
          return result.destroy();
        });
      },
      updateById(id, updates) {
        // Wrap instance delete method into class method
        // for easier chaining.
        return this
        .findById(id)
        .then(result => {
          return result.update(updates);
        });
      },
      findAllByActivity(activityId) {
        return this.findAll({
          where: { activity_id: activityId }
        });
      },
      serializeMany(data) {
        // Helper method used for converting query result in JSON.
        // Invoked directly on query results.
        return Serializer.serializeMany(data, this);
      }
    },
    instanceMethods: {
      serialize() {
        // Helper method used for converting query result in JSON.
        // Invoked directly on query results.
        return (new Serializer(this.Model)).serialize(this);
      }
    },
    underscored: true,
    freezeTableName: true
  });

  return Asset;
};
