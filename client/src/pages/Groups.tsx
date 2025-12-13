import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { GroupList, GroupChatRoom } from "@/components/groups/GroupChatRoom";
import type { Group } from "@shared/schema";

interface ActiveGroup {
  group: Group;
  anonUserHash: string;
  displayName: string;
}

export default function Groups() {
  const [activeGroup, setActiveGroup] = useState<ActiveGroup | null>(null);

  const handleSelectGroup = (group: Group, anonUserHash: string, displayName: string) => {
    setActiveGroup({ group, anonUserHash, displayName });
  };

  const handleLeaveGroup = () => {
    setActiveGroup(null);
  };

  return (
    <Layout>
      <div className="h-full">
        {activeGroup ? (
          <GroupChatRoom
            group={activeGroup.group}
            anonUserHash={activeGroup.anonUserHash}
            displayName={activeGroup.displayName}
            onLeave={handleLeaveGroup}
          />
        ) : (
          <GroupList onSelectGroup={handleSelectGroup} />
        )}
      </div>
    </Layout>
  );
}
