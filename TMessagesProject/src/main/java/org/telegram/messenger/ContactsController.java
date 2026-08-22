package org.telegram.messenger;

import org.telegram.tgnet.ConnectionsManager;
import org.telegram.tgnet.TLRPC;
import java.util.ArrayList;
import java.util.HashMap;

/**
 * ContactsController
 * Ported from DrKLO/Telegram (TMessagesProject/src/main/java/org/telegram/messenger/ContactsController.java)
 *
 * Device contacts synchronizer, Telegram user matcher, and contacts cache.
 */
public class ContactsController {

    private static volatile ContactsController[] Instance = new ContactsController[UserConfig.MAX_ACCOUNT_COUNT];
    public final int currentAccount;

    public final ArrayList<TLRPC.User> contacts = new ArrayList<>();
    public final HashMap<Long, TLRPC.User> contactsDict = new HashMap<>();
    public boolean contactsLoaded = false;

    public ContactsController(int account) {
        this.currentAccount = account;
    }

    public static ContactsController getInstance(int num) {
        ContactsController localInstance = Instance[num];
        if (localInstance == null) {
            synchronized (ContactsController.class) {
                localInstance = Instance[num];
                if (localInstance == null) {
                    Instance[num] = localInstance = new ContactsController(num);
                }
            }
        }
        return localInstance;
    }

    public void checkContacts() {
        if (!contactsLoaded) {
            loadContacts(false, 0);
        }
    }

    public void loadContacts(boolean force, long hash) {
        TLRPC.TL_contacts_getContacts req = new TLRPC.TL_contacts_getContacts();
        req.hash = hash;

        ConnectionsManager.getInstance(currentAccount).sendRequest(req, (response, error) -> {
            if (error == null && response instanceof TLRPC.contacts_Contacts) {
                contactsLoaded = true;
                NotificationCenter.getInstance(currentAccount).postNotificationName(NotificationCenter.contactsDidLoad);
            }
        });
    }

    public void addContact(TLRPC.User user) {
        if (user != null && !contactsDict.containsKey(user.id)) {
            contacts.add(user);
            contactsDict.put(user.id, user);
            NotificationCenter.getInstance(currentAccount).postNotificationName(NotificationCenter.contactsDidLoad);
        }
    }
}
