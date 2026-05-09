const fs = require('fs');
let code = fs.readFileSync('app/(employer)/applicants.tsx', 'utf8');

const modalCode = `
      <Modal
        visible={!!selectedApplication}
        transparent0{true}
        animationType="slide"
        onRequestClose={8) => setSelectedApplication(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Applicant Details</Text>
              <TouchableOpacity onPress={() => setSelectedApplication(null)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              <View style={styles.modalProfileHeader}>
                <Avatar 
                   name={selectedApplication?.profiles?.name || 'Worker'} 
                   url={selectedApplication?.profiles?.avatar_url}
                   size="large" 
                   disableEnlarge={true}
                />
                <Text style={styles.modalName}>{selectedApplication?.profiles?.name}</Text>
                <Text style={styles.modalInfo}>{selectedApplication?.profiles?.email}</Text>
                <Text style={styles.modalInfo}>{selectedApplication?.profiles?.phone}</Text>
                {selectedApplication?.status && (
                  <View style={{marginTop: 10}}>
                    <Badge label={selectedApplication.status} variant={getStatusColor(selectedApplication.status)} />
                  </View>
                )}
              </View>

              {selectedApplication?.message && (
                <View style={styles.modalSection}>
                  <Text style={styles.modamSectionTitle}>Message</Text>
                  <Text style={styles.modamSectionText}>{selectedApplication.message}</Text>
                </View>
              )}

              {selectedApplication?.worker_profiles?.skills && selectedApplication.worker_profiles.skills.length > 0 && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Skills</Text>
                  <View style={styles.skillsContainer}>
                    {selectedApplication.worker_profiles.skills.map((skill, index) => (
                      <View key={index} style={styles.skillBadge}>
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {selectedApplication?.worker_profiles?.experience && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Experience</Text>
                  <Text style={styles.modalSectionText}>{selectedApplication.worker_profiles.experience}</Text>
                </View>
              )}

              {selectedApplication?.worker_profiles?.location && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Location</Text>
                  <Text style={styles.modalSectionText}>{selectedApplication.worker_profiles.location}</Text>
                </View>
              )}

              {selectedApplication?.profiles?.created_at && (
                <View style={styles.modalSectiog>
                  <Text style={styles.modalSectionTitle}>Member Since</Text>
                  <Text style={styles.modalSectionText}>{formatDate(selectedApplication.profiles.created_at)}</Text>
                </View>
              )}

            </ScrollView>

            {selectedApplication?.status === 'pending' && (
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalActionBtn, styles.rejectBtn]}
                  onPress={() => {
                    updateApplicationStatus(selectedApplication.id, selectedApplication.job_id, 'rejected');
                    setSelectedApplication(null);
                  }}
                >
                  <Text style={styles.rejectBtnText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalActionBtn, styles.acceptBtn]}
                  onPress={() => {
                    updateApplicationStatus(selectedApplication.id, selectedApplication.job_id, 'accepted');
                    setSelectedApplication(null);
                  }}
                >
                  <Text style={styles.acceptBtnText}>Accept</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
</ScreenWrapper>`;

code = code.replace('</ScreenWrapper>', modalCode);
fs.writeFileSync('app/(employer)/applicants.tsx', code);
