const Record = require("../schema/records/schema");

const createRecord = async (recordData) => {
  try {
    const newRecord = new Record(recordData);
    return await newRecord.save();
  } catch (error) {
    throw new Error("Failed to save record: " + error.message);
  }
};

const mongoose = require("mongoose");

const getRecordsByAdmin = async (adminId, { templateId, search = "", page = 1, limit = 10 } = {}) => {
  try {
    const skip = (page - 1) * limit;
    
    // Base match for adminId and optional templateId
    const matchStage = {
      adminId: new mongoose.Types.ObjectId(adminId)
    };
    
    if (templateId) {
      matchStage.templateId = new mongoose.Types.ObjectId(templateId);
    }
    
    // Search match
    let searchStage = null;
    if (search && search.trim() !== "") {
      const regexSearch = { $regex: search.trim(), $options: "i" };
      
      searchStage = {
        $or: [
          { submitterName: regexSearch },
          { submitterEmail: regexSearch },
          {
            $expr: {
              $gt: [
                {
                  $size: {
                    $filter: {
                      input: { $objectToArray: "$data" },
                      as: "item",
                      cond: {
                        $regexMatch: {
                          input: {
                            $cond: {
                              if: { $isArray: "$$item.v" },
                              then: {
                                $reduce: {
                                  input: "$$item.v",
                                  initialValue: "",
                                  in: { $concat: ["$$value", " ", { $toString: "$$this" }] }
                                }
                              },
                              else: { $toString: "$$item.v" }
                            }
                          },
                          regex: search.trim(),
                          options: "i"
                        }
                      }
                    }
                  }
                },
                0
              ]
            }
          }
        ]
      };
    }
    
    const pipeline = [];
    pipeline.push({ $match: matchStage });
    if (searchStage) {
      pipeline.push({ $match: searchStage });
    }
    
    pipeline.push({ $sort: { createdAt: -1 } });
    
    // Total count facet vs data facet
    const facetPipeline = [
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $skip: skip },
            { $limit: parseInt(limit) },
            {
              $lookup: {
                from: "templates",
                localField: "templateId",
                foreignField: "_id",
                as: "template"
              }
            },
            {
              $unwind: {
                path: "$template",
                preserveNullAndEmptyArrays: true
              }
            }
          ]
        }
      }
    ];

    const result = await Record.aggregate(pipeline.concat(facetPipeline));
    
    const totalItems = result[0]?.metadata[0]?.total || 0;
    const records = result[0]?.data || [];
    
    // Clean up template structure to match previous populate
    const formattedRecords = records.map(r => ({
      ...r,
      templateId: r.template ? { _id: r.template._id, name: r.template.name, image: r.template.image } : r.templateId
    }));

    return {
      records: formattedRecords,
      totalItems,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalItems / limit) || 1
    };
    
  } catch (error) {
    throw new Error("Failed to fetch records: " + error.message);
  }
};

module.exports = {
  createRecord,
  getRecordsByAdmin
};
